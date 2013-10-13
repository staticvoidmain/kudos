using Kudos.Data;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace Kudos.Web.Hubs
{
	public class EventHub : Hub
	{
		public override Task OnConnected()
		{
			// todo: get the ravendb "network" for this user.
			// add this connection to the SignalR group for this network
			var user = Context.User;
			var repo = new KudosRepository();
			var network = repo.GetUserNetwork(user.Identity.Name);

			//	slightly easier, member of one network
			if (network != null)
			{
				Groups.Add(Context.ConnectionId, network.Id);
			}

			// todo: map one member to MANY networks
			return base.OnConnected();
		}

		public override Task OnDisconnected()
		{
			// remove the user from the SignalR group.

			return base.OnDisconnected();
		}

		public void Echo(string message)
		{
			Clients.All.echo(message);
		}
	}
}