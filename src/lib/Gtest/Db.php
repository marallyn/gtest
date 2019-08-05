<?php
namespace Gtest;

use mysqli;

class Db
{
	// db host name
	private $host = '';

	// db user name
	private $user = '';

	// db password
	private $password = '';

	// db database name
	private $database = '';

	// The mysqli object the database connection
	private $dbObj = null;

	// mysqli_result object
	private $result = null;

	public function __construct($host = '', $user = '', $password = '', $database = '')
	{
			$this->database = $database;
			$this->host = $host;
			$this->password = $password;
			$this->user = $user;
			// @todo add error handling
			$this->dbObj = new mysqli($host, $user, $password, $database);
	}

	public function escapeInput($term)
	{
		return $this->dbObj->real_escape_string($term);
	}//end escapeInput

	public function png($sql = '')
	{
			$this->put($sql);

			return $this->get();
	}

	public function put($sql = '')
	{
		$this->result = $this->dbObj->query($sql);
	}

	public function get()
	{
		for ($rows = []; $row = $this->result->fetch_array(MYSQLI_ASSOC);) {
			$rows[] = $row;
		}

		// return $this->result->fetch_all(MYSQLI_ASSOC);
		return $rows;
	}
}//end class
