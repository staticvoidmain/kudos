using System.Collections.Generic;
using Kudos.Data.Models;
using Raven.Abstractions.Data;

namespace Kudos.Data
{
	public class FindUserResult
	{
		public IEnumerable<User> MatchedUsers { get; set; }
		public string[] Suggestions { get; set; }
	}
}