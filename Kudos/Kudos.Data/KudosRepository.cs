using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using Kudos.Data.Indexes;
using Raven.Client;
using Raven.Client.Embedded;
using Raven.Client.Indexes;
using Raven.Client.Linq;
using Raven.Client.Document;
using Raven.Abstractions.Data;
using Kudos.Data.Models;
using System.Linq;

namespace Kudos.Data
{
	public class KudosRepository
	{
		private static readonly IDocumentStore documentStore; 

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

		public void AddUser(User user)
		{
			using (var session = OpenSession())
			{
				session.Store(user);
				session.SaveChanges();

				Debug.Assert(!string.IsNullOrEmpty(user.Id));
			}
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
	}
}