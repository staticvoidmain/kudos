using System.Collections.Generic;
using System.Web.Http;
using Kudos.Data;
using Kudos.Data.Models;

namespace Kudos.Web.Controllers
{
	public class UsersController : ApiController
	{
		private KudosRepository repository = new KudosRepository();

		public IEnumerable<User> Get()
		{
			return repository.GetUsers();
		}

		public User Get(string id)
		{
			string userId = string.Concat("users/", id);

			return repository.GetSingleUser(userId);
		}

		[HttpGet]
		public FindUserResult Find(string name)
		{
			return repository.FindUser(name);
		}

		public void Post([FromBody]User newUser)
		{
			repository.SaveUser(newUser);
		}
	}
}