using System;

namespace Kudos.Objects
{
	public class HatsOff
	{
		public int UserId { get; set; }
		public int RecipientId { get; set; }
		public string Comments { get; set; }
		public int Likes { get; set; }
		public DateTime Date { get; set; }
	}
}