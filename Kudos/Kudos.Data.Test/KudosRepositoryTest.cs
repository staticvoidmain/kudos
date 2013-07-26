using Kudos.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;

namespace Kudos.Data.Test
{
	[TestClass]
	public class KudosRepositoryTest
	{
		public TestContext TestContext { get; set; }
		
		[TestMethod]
		public void FindUser_Exact_Match_Returns_Single_Match_User()
		{
			KudosRepository target = new KudosRepository(); // TODO: Initialize to an appropriate value
			var actual = target.FindUser("Ross Jennings");

			Assert.Fail();
		}

		[TestMethod]
		public void FindUser_Incomplete_Returns_Suggested_Users()
		{
			KudosRepository target = new KudosRepository(); // TODO: Initialize to an appropriate value
			var actual = target.FindUser("Ross Jennings");

			Assert.Fail();
		}
	}
}
