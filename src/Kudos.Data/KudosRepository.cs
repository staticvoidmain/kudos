using System;
using System.Collections.Generic;
using System.Linq;
using Kudos.Data.Indexes;
using Kudos.Data.Models;
using Raven.Abstractions.Data;
using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Indexes;
using Raven.Client.Linq;

namespace Kudos.Data
{
	// I read that the repository pattern kinda sucks for RavenDB
	// TODO: Refactor to the controllers. Single session per controller.
	public class KudosRepository
	{
		private static readonly IDocumentStore documentStore;

		// too lazy for config files.
		static KudosRepository()
		{
			documentStore = new DocumentStore()
			{
				Url = "http://localhost:8080",
				DefaultDatabase = "kudos"
			};

			documentStore.Initialize();

			IndexCreation.CreateIndexes(typeof(KudosRepository).Assembly, documentStore);
		}

		// todo: remove this once Praise properly saves changes to networks
		// just for scaffolding purposes,.
		public void CreateNetwork(string[] ids)
		{
			using (var session = OpenSession())
			{
				session.Store(new PeerNetwork()
				{
					Users = ids
				});

				session.SaveChanges();
			}
		}

		public FindUserResult FindUser(string name)
		{
			var result = new FindUserResult();

			using (var session = OpenSession())
			{
				var query = session.Query<User, UsersByName>();
				var matches = query.Where(x => x.FullName.StartsWith(name)).ToArray();

				if (matches.Length == 0)
				{
					var suggest = query.Suggest(new SuggestionQuery()
					{
						Field = "FullName",
						Term = name,
						Accuracy = 0.1f,
						MaxSuggestions = 3,
						Distance = StringDistanceTypes.Levenshtein
					});

					if (suggest != null)
					{
						result.Suggestions = suggest.Suggestions;
					}
				}
				else
				{
					result.MatchedUsers = matches.ToArray();
				}
			}

			return result;
		}

		public IEnumerable<Praise> GetLatestKudos(DateTime lastUpdate)
		{
			using (var session = OpenSession())
			{
				var result = session.Query<Praise, PraiseMultiMapIndex>()
					.Where(p => p.Date >= lastUpdate)
					.Select(p => p);

				return result.ToArray();
			}
		}

		public PeerNetwork GetNetwork(int id)
		{
			using (var session = OpenSession())
			{
				string key = string.Concat("peernetworks/", id);

				return session.Load<PeerNetwork>(key);
			}
		}

		public IEnumerable<PeerNetwork> GetNetworks()
		{
			using (var session = OpenSession())
			{
				return session.Query<PeerNetwork>().ToArray();
			}
		}

		// todo: scaffolding, remove.
		public IList<Praise> GetPraise(string userId)
		{
			return new List<Praise>()
			{
				new ThumbsUp() { ReceiverId = userId, Date = DateTime.Now },
				new HatsOff() { ReceiverId = userId, Date = DateTime.Now },
				new ThumbsUp() { ReceiverId = userId, Date = DateTime.Now },
				new ThumbsUp() { ReceiverId = userId, Date = DateTime.Now },
				new ThumbsUp() { ReceiverId = userId, Date = DateTime.Now },
				new HatsOff() { ReceiverId = userId, Date = DateTime.Now }
			};
		}

		public User GetSingleUser(string id)
		{
			using (var session = OpenSession())
			{
				return session.Load<User>(id);
			}
		}

		public PraiseStatistics GetStatistics(string user)
		{
			using (var session = OpenSession())
			{
				return session.Query<PraiseStatistics, PraiseStatisticsByUser>()
					.Where(stats => stats.UserId == user)
					.FirstOrDefault();
			}
		}

		public IEnumerable<PraiseStatistics> GetTopStatistics()
		{
			using (var session = OpenSession())
			{
				return session.Query<PraiseStatistics, PraiseStatisticsByUser>()
					.OrderByDescending(s => s.PraiseValue)
					.Take(10)
					.ToArray();
			}
		}

		public PeerNetwork GetUserNetwork(string userName)
		{
			using (var session = OpenSession())
			{
				return session.Advanced.LuceneQuery<PeerNetwork, PeerNetworkByUserName>()
					.Where(string.Concat("UserNames: ", userName))
					.FirstOrDefault();
			}
		}

		public IEnumerable<User> GetUsers()
		{
			using (var session = OpenSession())
			{
				return session
					.Query<User>()
					.ToArray();
			}
		}

		public void SavePraise(Praise praise)
		{
			using (var session = OpenSession())
			{
				session.Store(praise);

				// todo: update the networks

				// get the

				session.SaveChanges();
			}
		}

		public void SaveUser(User user)
		{
			using (var session = OpenSession())
			{
				session.Store(user);
				session.SaveChanges();
			}
		}

		private IDocumentSession OpenSession()
		{
			return documentStore.OpenSession("kudos");
		}

		public User GetUserByUserName(string name)
		{
			using (var session = OpenSession())
			{
				return session.Query<User, UsersByName>()
					.Where(user => user.UserName == name)
					.FirstOrDefault();
			}
		}
	}
}