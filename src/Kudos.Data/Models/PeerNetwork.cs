using System.Collections.Generic;

namespace Kudos.Data.Models
{
	// todo: design this a bit better.
	// currently a user can be a member of N groups, however
	// selecting which networks the user should belong to is 
	// a nontrivial problem
	public class PeerNetwork
	{
		public string Id { get; set; }
		public IList<string> Users { get; set; }
	}
}