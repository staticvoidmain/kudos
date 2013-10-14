using System.Collections.Generic;

namespace Kudos.Data.Models
{
	// does this model represent a full user, or just a search result?
	public class User
	{
		public string Id { get; set; }
		public string FullName { get; set; }
		public string UserName { get; set; }
		public string Email { get; set; }

		// todo: should this be a thumb? yeah...
		public string Picture { get; set; }
	}
}