using System.Linq;
using Raven.Abstractions.Indexing;
using Raven.Client.Indexes;

namespace Kudos.Data.Indexes
{
	
	public class Users_ByFullName 
		: AbstractIndexCreationTask<User>
	{
		public Users_ByFullName()
		{
			Map = users => from user in users
						   select new { user.FullName };

			Indexes.Add(x => x.FullName, FieldIndexing.Analyzed);
		}
	}
}
