using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using Kudos.Data.Indexes;
using Raven.Client;
using Raven.Client.Embedded;
using Raven.Client.Indexes;

namespace Kudos.Data
{
	public class KudosRepository
	{
		private static string dataDirectory = 
			Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "kudos", "db");

		private static readonly IDocumentStore documentStore; 

		static KudosRepository()
		{
			documentStore = new EmbeddableDocumentStore()  
			{
				DataDirectory = dataDirectory
			};

			documentStore.Initialize();

			IndexCreation.CreateIndexes(typeof(KudosRepository).Assembly, documentStore);
		}

		// todo: text search for users.
		public FindUserResult FindUser(string name)
		{
			var result = new FindUserResult();

			using (var session = documentStore.OpenSession())
			{
				var query = session.Query<User, Users_ByFullName>().Where(x => x.FullName == name);
			
				result.MatchedUser = query.FirstOrDefault();

				if (result.MatchedUser == null)
				{
					result.Suggestions = query.Suggest();
				}
			}

			return result;
		}

		public void AddUser(string userName)
		{
			using (var session = documentStore.OpenSession())
			{
				var user = new User() { UserName = userName };

				session.Store(user);
				session.SaveChanges();

				Debug.Assert(!string.IsNullOrEmpty(user.Id));
			}
		}

		public User GetSingleUser(string id)
		{
			using (var session = documentStore.OpenSession())
			{
				User user = session.Load<User>("users/65");

				return user;
			}
		}

		public IEnumerable<User> GetUsers()
		{
			IEnumerable<User> users;
			using (var session = documentStore.OpenSession())
			{
				users = session
					.Query<User>()
					.ToArray();
			}

			return users;
		}
	}
}