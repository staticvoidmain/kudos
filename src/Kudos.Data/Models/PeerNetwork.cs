using System.Collections.Generic;

namespace Kudos.Data.Models
{
	public class PeerNetwork
	{
		public string Id { get; set; }
		public IList<string> Users { get; set; }
	}
}