using Kudos.Data.Models;
using Raven.Abstractions.Data;

namespace Kudos.Data
{
	public class FindUserResult
	{
		public User MatchedUser { get; set; }
		public SuggestionQueryResult Suggestions { get; set; }
	}
}
