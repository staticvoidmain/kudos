using System.Linq;
using Raven.Abstractions.Indexing;
using Raven.Client.Indexes;
using Kudos.Data.Models;

namespace Kudos.Data.Indexes
{
	public class UsersByFullName 
		: AbstractIndexCreationTask<User>
	{
		public UsersByFullName()
		{
			Map = users => from user in users
						   select new { user.FullName };

			Indexes.Add(x => x.FullName, FieldIndexing.Analyzed);
		}
	}
}
