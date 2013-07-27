namespace Kudos.Data.Models
{
	public class User
	{
		public string Id { get; set; }
		public string FullName { get; set; }
		public string UserName { get; set; }
		public string Email { get; set; }
		public string Picture { get; set; }

		// todo: ravendb index tasks for these
		public int Points { get; set; }
		public int ThumbsUpCount { get; set; }
		public int HatsOffCount { get; set; }
	}
}