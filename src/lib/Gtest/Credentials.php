<?php
namespace Gtest;

class Credentials
{
	// json object found in the fileName
	private $creds;

	// fully qualified fileName where credentials are stored
	private $fileName;

	// bool for local (dev) or cloud (production)
	private $isLocal;

	public function __construct($fileName, $isLocal = false)
	{
		$this->fileName = $fileName;
		$this->isLocal = $isLocal;

		// check if the credential file exists
		if (!\is_file($fileName)) {
			throw new \Exception("This: '{$fileName}' is not a file Bozo.");
		}
		
		$contents = file_get_contents($fileName);
		$decodedResults = json_decode($contents);

		// make sure there was some json in there
		if ($decodedResults === null) {
			throw new \Exception(
				"Whatever the heck is in your credentials file is not JSON: "
					. \json_last_error_msg()
			);
		}

		$this->creds = $decodedResults;

		$this->clean();
	}

	private function clean()
	{
		// move all the creds->local keys to the main object if local
		if (isset($this->creds->local) && $this->isLocal) {
			foreach ($this->creds->local as $key => $val) {
				$this->creds->{$key} = $val;
			}
		}

		// remove the local subset of creds whether we are local or not
		if (isset($this->creds->local)) {
			unset($this->creds->local);
		}

		// move all the creds->cloud keys to the main object if not local
		if (isset($this->creds->cloud) && !$this->isLocal) {
			foreach ($this->creds->cloud as $key => $val) {
				$this->creds->{$key} = $val;
			}
		}

		// remove the cloud subset of creds whether we are local or not
		if (isset($this->creds->cloud)) {
			unset($this->creds->cloud);
		}
	}

	public function getAllCreds()
	{
		return $this->creds;
	}

	public function getCred($property)
	{
		return isset($this->creds->{$property})
			? $this->creds->{$property}
			: null;
	}

}//end class
