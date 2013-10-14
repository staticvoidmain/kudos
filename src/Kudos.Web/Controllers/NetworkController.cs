using System.Collections.Generic;
using System.Web.Http;
using Kudos.Data;
using Kudos.Data.Models;

namespace Kudos.Web.Controllers
{
    public class NetworksController : ApiController
    {
		private readonly KudosRepository repository = new KudosRepository();

        public IEnumerable<PeerNetwork> Get()
        {
			return repository.GetNetworks();
        }

        public PeerNetwork Get(int id)
        {
			return repository.GetNetwork(id);
        }
    }
}
