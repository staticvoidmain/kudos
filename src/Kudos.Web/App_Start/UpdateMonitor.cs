using Kudos.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Kudos.Web.App_Start
{
	public static class UpdateMonitor
	{
		private static readonly CancellationTokenSource tokenSource = new CancellationTokenSource();

		public static void Begin()
		{
			KudosRepository repository = new KudosRepository();

			Task.Factory.StartNew(() => 
			{
				DateTime lastUpdate = DateTime.Now;
				CancellationToken token = tokenSource.Token;

				while (true)
				{
					token.ThrowIfCancellationRequested();

					// check for updates since the last check
					// get the group(s)
					// publish the update
					// sleep

					var recentKudos = repository.GetLatestKudos(lastUpdate);

					lastUpdate = DateTime.Now;

					Thread.Sleep(500);
				}
			}, TaskCreationOptions.LongRunning);
		}

		public static void End() 
		{
			tokenSource.Cancel();
		}
	}
}