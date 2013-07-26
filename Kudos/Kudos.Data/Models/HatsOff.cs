// -----------------------------------------------------------------------
// <copyright file="HatsOff.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Kudos.Objects
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;

	/// <summary>
	/// TODO: Update summary.
	/// </summary>
	public class HatsOff
	{
		public int UserId { get; set; }
		public int RecipientId { get; set; }
		public string Comments { get; set; }
		public int Likes { get; set; }
		public DateTime Date { get; set; }
	}
}