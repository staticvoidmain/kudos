using Kudos.Data;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;

namespace Kudos.Data.Test
{
	[TestClass]
	public class KudosRepositoryInitialization
	{
		[TestMethod, TestCategory("Init")]
		public void AddUser_To_DatabaseWorks()
		{
			KudosRepository target = new KudosRepository();
			target.AddUser(new User() { FullName = "Ross Jennings", UserName = "rjennings" });
			target.AddUser(new User() { FullName = "Ravi Kant", UserName = "rkant" });
			target.AddUser(new User() { FullName = "Victor Diaz", UserName = "vsdiaz" });
			target.AddUser(new User() { FullName = "Chelsey Morgan", UserName = "cmorgan" });
		}
	}
}
