using Kudos.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;

namespace Kudos.Data.Test
{
	[TestClass]
	public class KudosRepositoryTest
	{
		public TestContext TestContext { get; set; }

		[TestMethod]
		public void FindUser_Exact_Match_Returns_Single_Match_User()
		{
			KudosRepository target = new KudosRepository();
			var result = target.FindUser("Ross Jennings");

			Assert.IsNotNull(result);
			Assert.IsNotNull(result.MatchedUser);
		}

		[TestMethod]
		public void FindUser_Incomplete_Returns_Suggested_Users()
		{
			KudosRepository target = new KudosRepository();
			var result = target.FindUser("Ross");

			Assert.IsNotNull(result);
			Assert.IsNotNull(result.Suggestions);
			Assert.IsTrue(result.Suggestions.Suggestions.Length > 0);
		}

		[TestMethod]
		public void GetUsers()
		{
			KudosRepository target = new KudosRepository();
			IEnumerable<User> users = target.GetUsers();
			Assert.IsNotNull(users);
		}
	}
}
