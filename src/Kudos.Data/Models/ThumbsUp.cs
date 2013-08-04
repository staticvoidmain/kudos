using System;

namespace Kudos.Data.Models
{
	public class ThumbsUp : Praise
	{
		public override decimal Value
		{
			get { return 100; }
		}
	}
}