using System;

namespace Kudos.Data.Models
{
	public class HatsOff : Praise
	{
		public int Likes { get; set; }

		public override decimal Value
		{
			get 
			{
				const int baseValue = 100;
				const int maxLikes = 5;
				const int multiplier = 100;

				return baseValue + (Math.Min(maxLikes, Likes) * multiplier); 
			}
		}
	}
}