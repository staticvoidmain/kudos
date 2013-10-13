using System;
using System.Linq;
using Kudos.Data.Models;
using Raven.Abstractions.Indexing;
using Raven.Client.Indexes;

namespace Kudos.Data.Indexes
{
	public class PraiseStatistics
	{
		public string UserId { get; set; }
		public decimal PraiseValue { get; set; }
		public int PraiseCount { get; set; }
		public int LikeCount { get; set; }
		public DateTime LastPraiseDate { get; set; }
	}

	public class PraiseStatisticsByUser
		: AbstractMultiMapIndexCreationTask<PraiseStatistics>
	{
		public PraiseStatisticsByUser()
		{
			AddMap<ThumbsUp>(praise => from item in praise
									   select new PraiseStatistics() 
									   {
										   UserId = item.ReceiverId,
										   PraiseValue = item.Value,
										   PraiseCount = 1,
										   LastPraiseDate = item.Date,
										   LikeCount = 0
									   });

			AddMap<HatsOff>(praise => from item in praise
									  select new PraiseStatistics()
									  {
										  UserId = item.ReceiverId,
										  PraiseValue = item.Value,
										  PraiseCount = 1,
										  LastPraiseDate = item.Date,
										  LikeCount = item.Likes
									  });

			Reduce = results => from result in results
								group result by result.UserId into g
								select new PraiseStatistics()
								{
									UserId = g.Key,
									PraiseValue = g.Sum(x => x.PraiseValue),
									PraiseCount = g.Sum(x => x.PraiseCount),
									LikeCount =  g.Sum(x => x.LikeCount),
									LastPraiseDate = g.Max(item => item.LastPraiseDate),
								};

			Sort(stats => stats.PraiseValue, SortOptions.Double);
		}
	}
}
