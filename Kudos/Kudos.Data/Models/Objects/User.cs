// -----------------------------------------------------------------------
// <copyright file="User.cs" company="Microsoft">
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
	public class User
	{
		public int Id { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string Email { get; set; }
		public string Picture { get; set; } // need to change the variable type for this
		public int Points { get; set; }
		public int NumThumbsUp { get; set; }
		public int NumHatsOff { get; set; }
	}
}
