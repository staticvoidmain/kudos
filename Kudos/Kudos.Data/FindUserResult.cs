using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Raven.Abstractions.Data;

namespace Kudos.Data
{
	public class FindUserResult
	{
		public User MatchedUser { get; set; }
		public SuggestionQueryResult Suggestions { get; set; }
	}
}
