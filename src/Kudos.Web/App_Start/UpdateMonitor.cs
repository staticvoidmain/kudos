using Kudos.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR.Infrastructure;
using Microsoft.AspNet.SignalR;
using Kudos.Web.Hubs;

namespace Kudos.Web.App_Start
{
	public static class UpdateMonitor
	{
		private static readonly CancellationTokenSource tokenSource = new CancellationTokenSource();

		public static void Begin()
		{
			var repository = new KudosRepository();
			var hubContext = GlobalHost.ConnectionManager.GetHubContext<EventHub>();

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
					var recentKudos = repository.GetLatestKudos(lastUpdate);

					// SELECT N + 1
					// what I really want here is networks by latest kudos.
					// so lets just do THAT
					foreach (var recent in recentKudos)
					{
						var network = repository.GetUserNetwork(recent.ReceiverId);
						var group = hubContext.Clients.Group(network.Id).echo("cool");
					}

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