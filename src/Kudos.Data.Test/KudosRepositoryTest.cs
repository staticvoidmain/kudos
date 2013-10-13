using Kudos.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using Kudos.Data.Models;

namespace Kudos.Data.Test
{
	[TestClass]
	public class KudosRepositoryTest
	{
		public TestContext TestContext { get; set; }

		[TestMethod, TestCategory("UnitTest")]
		public void FindUser_Exact_Match_Returns_Single_Match_User()
		{
			KudosRepository target = new KudosRepository();
			var result = target.FindUser("Ross Jennings");

			Assert.IsNotNull(result);
			Assert.IsNotNull(result.MatchedUser);
		}

		[TestMethod, TestCategory("UnitTest")]
		public void FindUser_Incomplete_Returns_Suggested_Users()
		{
			KudosRepository target = new KudosRepository();
			var result = target.FindUser("Rossy");

			Assert.IsNotNull(result);
			Assert.IsNotNull(result.Suggestions);
			Assert.IsTrue(result.Suggestions.Length > 0);
		}

		[TestMethod, TestCategory("UnitTest")]
		public void GetUsers()
		{
			KudosRepository target = new KudosRepository();
			IEnumerable<User> users = target.GetUsers();
			Assert.IsNotNull(users);
		}

		[TestMethod, TestCategory("UnitTest")]
		public void GetPraiseStatsByUser()
		{
			KudosRepository target = new KudosRepository();

			var stats = target.GetStatistics("users/4");

			Assert.IsNotNull(stats);
		}

		[TestMethod, TestCategory("UnitTest")]
		public void GetTopPraiseStatistics()
		{
			KudosRepository target = new KudosRepository();

			var stats = target.GetTopStatistics();

			Assert.IsNotNull(stats);
		}
	}
}