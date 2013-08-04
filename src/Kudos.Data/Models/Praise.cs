using System;

namespace Kudos.Data.Models
{
	public abstract class Praise
	{
		public string Id { get; set; }
		public DateTime Date { get; set; }
		public string SenderId { get; set; }
		public string ReceiverId { get; set; }
		public string Note { get; set; }

		public abstract Decimal Value { get; }
	}
}
