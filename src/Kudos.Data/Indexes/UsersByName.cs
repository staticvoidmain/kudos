using System.Linq;
using Kudos.Data.Models;
using Raven.Abstractions.Indexing;
using Raven.Client.Indexes;

namespace Kudos.Data.Indexes
{
	public class UsersByName
		: AbstractIndexCreationTask<User>
	{
		public UsersByName()
		{
			Map = users => from user in users
						   select new { user.FullName, user.UserName };

			Indexes.Add(x => x.FullName, FieldIndexing.Analyzed);
			Indexes.Add(x => x.UserName, FieldIndexing.Default);
		}
	}
}