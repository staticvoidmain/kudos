using System;
using Raven.Client.Document;
using Raven.Client.Embedded;
using System.IO;

namespace Kudos.Data
{
	public class KudosRepository
	{
		private static string dataDirectory = 
			Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "kudos", "db");

		private static readonly DocumentStore documentStore; 

		static KudosRepository()
		{
			documentStore = new EmbeddableDocumentStore()  
			{
				DataDirectory = dataDirectory
			};

			documentStore.Initialize();
		}

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