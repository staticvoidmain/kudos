using Kudos.Data.Models;
using Raven.Client.Indexes;
using System.Linq;

namespace Kudos.Data.Indexes
{
	public class PeerNetworkByUserName
		: AbstractIndexCreationTask<PeerNetwork>
	{
		// for reference: http://ayende.com/blog/160513/ravendb-feature-of-the-year-indexing-related-documents
		public PeerNetworkByUserName()
		{
			Map = networks => from network in networks
							  select new 
							  {
								  NetworkId = network.Id,
								  UserNames = network.Users.Select(id => LoadDocument<User>(id).UserName)
							  };
		}
	}
}
