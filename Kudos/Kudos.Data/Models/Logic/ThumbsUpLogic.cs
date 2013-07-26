// -----------------------------------------------------------------------
// <copyright file="ThumbsUpLogic.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Kudos.Logic
{
	using System;
	using System.Collections.Generic;
	using System.Linq;
	using System.Text;
	using Kudos.Objects;

	/// <summary>
	/// TODO: Update summary.
	/// </summary>
	public class ThumbsUpLogic
	{

		public ThumbsUp SearchThumbsUp(int recipientId, List<ThumbsUp> thumbsUpList)
		{
			return thumbsUpList.Find(thumbsUp => thumbsUp.RecipientId == recipientId);
		}

		public bool RedeemThumbsUp(int recipientId)
		{


			return true;
		}
	}
}
