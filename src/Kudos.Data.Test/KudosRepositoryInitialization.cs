using Kudos.Data.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Linq;

namespace Kudos.Data.Test
{
	/// <summary>
	/// Run these 
	/// </summary>
	[TestClass]
	public class KudosRepositoryInitialization
	{
		[TestMethod, TestCategory("Init")]
		public void Scaffold_Users()
		{
			KudosRepository target = new KudosRepository();
			target.SaveUser(new User() { FullName = "Ross Jennings", UserName = "rjennings", Picture = "http://gravatar.com/avatar/18a654f653559532d073dfb6000d06a5" });
			target.SaveUser(new User() { FullName = "Ravi Kant", UserName = "rkant" });
			target.SaveUser(new User() { FullName = "Victor Diaz", UserName = "vsdiaz" });
			target.SaveUser(new User() { FullName = "Chelsey Morgan", UserName = "cmorgan" });
			target.SaveUser(new User() { FullName = "Derrick McDowell", UserName = "dmcdowell" });
			target.SaveUser(new User() { FullName = "Andrew C. Lo", UserName = "alo" });
			target.SaveUser(new User() { FullName = "David Robertson", UserName = "drobertson" });
			target.SaveUser(new User() { FullName = "Lisa Fidler", UserName = "lfidler" });
		}

		[TestMethod, TestCategory("Init")]
		public void Scaffold_Random_Kudos()
		{
			KudosRepository target = new KudosRepository();

			var users = target.GetUsers();
			Random rng = new Random();

			for (int i = 0; i < 150; i++)
			{
				var sender = users.ElementAt(rng.Next(0, users.Count() - 1));

				User receiver;
				do {
					receiver = users.ElementAt(rng.Next(0, users.Count() - 1));
				} while (receiver == sender);

				Praise p = RandomPraise(rng);

				p.SenderId = sender.Id;
				p.ReceiverId = receiver.Id;
				p.Date = DateTime.Now.AddDays(-rng.Next(10, 70));
				p.Note = string.Format("Kudos to you {0}!", receiver.FullName);

				target.SavePraise(p);
			}
		}


		// technically this should go away once SavePraise properly updates
		// the networks, but until then we'll use it.
		[TestMethod, TestCategory("Init")]
		public void Scaffold_Networks()
		{
			// builds two disjoint networks
			KudosRepository repository = new KudosRepository();

			var users = repository.GetUsers().ToArray();
			int lengthFirst = users.Length / 2;
			int lengthSecond = users.Length - lengthFirst;

			string[] first = new string[lengthFirst], 
					 second = new string[lengthSecond];

			for (int i = 0; i < lengthFirst; i++)
			{
				first[i] = users[i].Id;
			}

			for (int i = 0; i < lengthSecond; i++)
			{
				second[i] = users[lengthFirst + i].Id;
			}

			repository.CreateNetwork(first);
			repository.CreateNetwork(second);
		}

		#region Private Methods

		private Praise RandomPraise(Random rng)
		{
			if (rng.NextDouble() > 0.5)
					return new ThumbsUp();

			return new HatsOff();
		}

		#endregion

		// todo: build relationships / networks
	}
}