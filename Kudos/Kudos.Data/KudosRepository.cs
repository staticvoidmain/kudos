using System;
using Raven.Client.Document;
using Raven.Client.Embedded;

namespace Kudos.Data
{
	// todo: MapReduce task for gathering point values for a user.
	// todo: 

	public class KudosRepository
	{
		private static readonly DocumentStore documentStore; 

		static KudosRepository()
		{
			documentStore = new EmbeddableDocumentStore()  
			{
				DataDirectory = "/app_data/db"
			};

			documentStore.Initialize();
		}

		// init RavenDB repo here.

		// todo: text search for users.
		public object FindUser(string name)
		{
			using (var session = documentStore.OpenSession())
			{
				
			}

			throw new NotImplementedException("todo: all the things!");
		}
	}
}