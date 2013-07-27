using System;

namespace Kudos.Data.Models
{
	public class ThumbsUp
	{
		public int UserId { get; set; }
		public int RecipientId { get; set; }
		public string Comments { get; set; }
		public DateTime Date { get; set; }
	}
}
