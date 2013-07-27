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

			return base.OnConnected();
		}

		public override Task OnDisconnected()
		{
			// remove the user from the SignalR group.

			return base.OnDisconnected();
		}

		public void Hello()
		{
			Clients.All.hello("Hi guys!");
		}
	}
}