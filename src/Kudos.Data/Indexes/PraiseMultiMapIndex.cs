using System.Linq;
using Kudos.Data.Models;
using Raven.Client.Indexes;

namespace Kudos.Data.Indexes
{
	public class PraiseMultiMapIndex
		: AbstractMultiMapIndexCreationTask
	{
		/// <summary>
		/// Map both the ThumbsUp and HatsOff so that they can be pulled back later for updates.
		/// </summary>
		public PraiseMultiMapIndex()
		{
			AddMap<ThumbsUp>(collection => collection.Select(praise => new { praise.Date }));

			AddMap<HatsOff>(collection => collection.Select(praise => new { praise.Date }));

			// the implication here is that there is no reduce step, so all fields are available.
		}
	}
}