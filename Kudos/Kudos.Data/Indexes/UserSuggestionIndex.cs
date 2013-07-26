using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Raven.Client.Indexes;
using Raven.Abstractions.Indexing;

namespace Kudos.Data.Indexes
{
	public class Users_ByFullName : AbstractIndexCreationTask<User>
	{
		public Users_ByFullName()
		{
			Map = users => from user in users
						   select new { user.FullName };

			Indexes.Add(x => x.FullName, FieldIndexing.Analyzed);
		}
	}
}
