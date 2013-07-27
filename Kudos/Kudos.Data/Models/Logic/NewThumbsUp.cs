// -----------------------------------------------------------------------
// <copyright file="NewThumbsUp.cs" company="Microsoft">
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
	public class NewThumbsUp
	{
		// in case you want to pass a new thumbs up by each field
		public bool CreateThumbsUp(int userId, int recipientId, string comments, DateTime date, List<ThumbsUp> thumbsUpList)
		{
			ThumbsUp thumbsUp = new ThumbsUp { UserId = userId, RecipientId = recipientId, Comments = comments, Date = date };
			return CreateThumbsUp(thumbsUp, thumbsUpList);
		}

		// create a new new thumbsup
		public bool CreateThumbsUp(ThumbsUp thumbsUp, List<ThumbsUp> thumbsUpList)
		{
			bool valid = CheckTimeFrame(thumbsUp, thumbsUpList);

			if (valid == true)
			{
				thumbsUpList.Add(thumbsUp);
			}

			return valid;
		}

		// to check if they've not had one this week....
		private bool CheckTimeFrame(ThumbsUp thumbsUp, List<ThumbsUp> thumbsUpList)
		{
			bool valid = true;
			ThumbsUp exsistingThumbsUp = new ThumbsUpLogic().SearchThumbsUp(thumbsUp.RecipientId, thumbsUpList);

			if (exsistingThumbsUp != null)
			{
				if (thumbsUp.Date < (exsistingThumbsUp.Date.AddDays(7)))
				{
					valid = false;
				}
			}

			return valid;
		}
	}
}

