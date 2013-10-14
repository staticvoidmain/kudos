using Kudos.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using Kudos.Data.Models;
using System.Linq;

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
			Assert.IsNotNull(result.MatchedUsers);
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
		public void GetUsers_Returns_Non_Null_Collection()
		{
			KudosRepository target = new KudosRepository();
			IEnumerable<User> users = target.GetUsers();
			Assert.IsNotNull(users);
			Assert.AreNotEqual(0, users.Count());
		}

		[TestMethod, TestCategory("UnitTest")]
		public void GetStatistics_ByUser_Returns_Non_Null_Collection()
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

		[TestMethod, TestCategory("UnitTest")]
		public void GetUserNetwork_For_Existing_User_Returns_Network()
		{
			var target = new KudosRepository();
			var network = target.GetUserNetwork("rjennings");

			Assert.IsNotNull(network);
		}
	}
}