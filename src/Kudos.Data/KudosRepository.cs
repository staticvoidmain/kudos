using Kudos.Data.Indexes;
using Kudos.Data.Models;
using Raven.Abstractions.Data;
using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Indexes;
using Raven.Client.Linq;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Kudos.Data
{
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

		private IDocumentSession OpenSession()
		{
			return documentStore.OpenSession("kudos");
		}

		// todo: text search for users.
		// technically we don't even need this...
		public FindUserResult FindUser(string name)
		{
			var result = new FindUserResult();

			using (var session = OpenSession())
			{
				var query = session.Query<User, UsersByFullName>();

				result.MatchedUser = query.Where(x => x.FullName == name).FirstOrDefault();

				if (result.MatchedUser == null)
				{
					result.Suggestions = query.Suggest(new SuggestionQuery() 
					{
                        Field = "FullName",
                        Term = name,
                        Accuracy = 0.1f,
                        MaxSuggestions = 5,
                        Distance = StringDistanceTypes.Levenshtein
					});
				}
			}

			return result;
		}

		public IEnumerable<User> GetUsers()
		{
			IEnumerable<User> users;
			using (var session = OpenSession())
			{
				users = session
					.Query<User>()
					.ToList();
			}

			return users;
		}

		public User GetSingleUser(int id)
		{
			throw new System.NotImplementedException();
		}

		public void SaveUser(User user)
		{
			using (var session = OpenSession())
			{
				session.Store(user);
				session.SaveChanges();
			}
		}

		public void SavePraise(Praise praise)
		{
			using (var session = OpenSession())
			{
				// todo: update the networks

				session.Store(praise);
				session.SaveChanges();
			}
		}

		// todo: remove this once Praise properly saves changes to networks
		// just for scaffolding purposes, ignore.
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

		public PeerNetwork GetUserNetwork(string userName)
		{
			using (var session = OpenSession())
			{
				return null;
				//return session.Query<PeerNetwork, PeerNetworkByUserName>().
				//	.FirstOrDefault();
			}
		}
	}
}