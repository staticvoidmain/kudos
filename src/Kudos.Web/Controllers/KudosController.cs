using Kudos.Data;
using Kudos.Data.Models;
using System.Collections.Generic;
using System.Web.Http;

namespace Kudos.Web.Controllers
{
	public class KudosController : ApiController
	{
		KudosRepository repo = new KudosRepository();

		// GET api/<controller>/
		public IList<Praise> Get(string userId)
		{
			return repo.GetPraise(userId);
		}

		// POST api/<controller>
		public void Post([FromBody]Praise value)
		{
			// todo: stuff!


			repo.SavePraise(value);
		}
	}
}