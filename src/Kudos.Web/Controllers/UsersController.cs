using Kudos.Data;
using Kudos.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Kudos.Web.Controllers
{
	public class UsersController : ApiController
	{
		private KudosRepository repository = new KudosRepository();

		// GET api/values
		public IEnumerable<User> Get()
		{
			return repository.GetUsers();
		}

		// GET api/values/5
		public User Get(int id)
		{
			return repository.GetSingleUser(id);
		}

		// POST api/values
		public void Post([FromBody]User newUser)
		{
			repository.SaveUser(newUser);
		}
	}
}