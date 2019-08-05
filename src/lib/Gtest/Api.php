<?php
namespace Gtest;

class Api
{
	private $endpoint;
	private $maxRows = 6;
	private $method;
	private $origin = null;
	private $parmArr = [];
	private $responseCode = 200;
	private $result = [];
	private $httpCodes = [
		200 => 'OK',
		204 => 'No Content',
		400 => 'Bad Request',
		401 => 'Unauthorized',
		403 => 'Forbidden',
		404 => 'Not Found',
		405 => 'Method Not Allowed'
	];
	private $allowedOrigins = [ '*' ];

	public function __construct($config = [])
	{
		if (!isset($_GET['x']) || $_GET['x'] === "") {
			// respond and exit
			$this->respondWithError(400, 'No endpoint provided for api request.');
		}

		$this->endpoint = \trim($_GET['x'], '/');
		// set any propeties that were passed in the config
		$className = \get_class($this);
		foreach ($config as $key => $value) {
			if (\property_exists($className, $key)) {
				$this->{$key} = $value;
			}
		}

		// store the reason why the user is here
		$this->method = $_SERVER['REQUEST_METHOD'];

		$this->go();
	}

	public function addResult($val, $index = '')
	{
		if ($index) {
			$this->result[$index] = $val;
			// $this->result[$index] = \array_merge(
			// 	isset($this->result[$index]) ? $this->result[$index] : [],
			// 	$val
			// );
		} else {
			$this->result = \array_merge($this->result, $val);
		}
	}

	private function go()
	{
		switch ($this->method) {
			case 'GET':
				$this->extractGetParms();
				break;
			case 'DELETE': // @todo implement or not
			case 'POST':
			case 'PUT':
				$this->extractJsonParms();
				break;
			case 'OPTIONS':
				$this->respondToPreflight();
				break;
			default:
				$this->respondWithError(405, "'{$this->method}' is not a supported method.");
				break;
		}
	}//end do

	private function extractGetParms()
	{
		$this->parmArr = [];
		$query = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
		$qPos = \strpos($query, '?');
		if ($qPos !== false) {
			$a = \array_map(
				function ($parm) {
					return  \explode('=', $parm);
				},
				\explode('&', \urldecode(\substr($query, $qPos + 1)))
			);
			// $a is an array of arrays of parameter and values
			// we want to turn it into an associative array of paramter => value
			foreach ($a as $arr) {
				$this->parmArr[$arr[0]] = $arr[1];
			}
		}

		return $this->parmArr;
	}

	private function extractJsonParms()
	{
		$decodedInput = json_decode(file_get_contents('php://input'));
		if (!$decodedInput) {
			$this->respondWithError(
				400,
				'We could not read your json data from the stream. Please do better next time. '
					. \json_last_error_msg()
			);
		}

		$this->parmArr = (array) $decodedInput;
	}

	public function getEndpoint()
	{
		return $this->endpoint;
	}

	public function getMethod()
	{
		return $this->method;
	}

	public function getParams($index = '')
	{
		if ($index) {
			if (isset($this->parmArr[$index])) {
				return $this->parmArr[$index];
			} else {
				return null;
			}
		} else {
			return $this->parmArr;
		}
	}

	public function getJsonParms($isInsert)
	{
		$decodedInput = json_decode(file_get_contents('php://input'));
		if (!$decodedInput) {
			$this->respondWithError(400, 'We could not read your json data from the stream. Please do better next time.');
		}

		$this->parmArr = (array) $decodedInput;
	}

	private function utf8ize($mixed)
	{
		if (is_array($mixed)) {
			foreach ($mixed as $key => $value) {
				$mixed[$key] = $this->utf8ize($value);
			}
		} elseif (is_string($mixed)) {
			return mb_convert_encoding($mixed, "UTF-8", "UTF-8");
		}
		return $mixed;
	}

	public function respond()
	{
		$origin = $this->verifyOrigin();
		$this->sendHeaderCode($this->responseCode);
		header("Access-Control-Allow-Origin: $origin");
		header('Content-type: application/json');
		echo json_encode($this->utf8ize($this->result));
	}

	public function respondToPreflight()
	{
		$origin = $this->verifyOrigin();
		$this->responseCode = 204;
		$this->sendHeaderCode($this->responseCode);
		header('Connection: keep-alive');
		header("Access-Control-Allow-Origin: $origin");
		header('Access-Control-Allow-Methods: GET, OPTIONS, POST, PUT');
		header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
		header('Access-Control-Max-Age: 86400');
		header('Vary: Origin');
		exit($this->responseCode);
	}

	private function respondWithError($code, $message)
	{
		$this->responseCode = $code;
		$this->addResult([$message], 'error');
		$this->respond();
		exit($code);
	}

	private function sendHeaderCode($code)
	{
		header("HTTP/1.1 $code {$this->httpCodes[$code]}");
	}

	public function setResponseCode($code)
	{
		$this->responseCode = $code;
	}

	private function verifyOrigin()
	{
		// only do this once to avoid endless looping in the event of multiple errors
		if ($this->origin === null) {
			$originSet = isset($_SERVER['HTTP_ORIGIN']);
			$this->origin = $originSet ? $_SERVER['HTTP_ORIGIN'] : '';

			if ($originSet && !\in_array($this->origin, $this->allowedOrigins) && !\in_array('*', $this->allowedOrigins)) {
				$this->respondWithError(403, "Your origin '{$this->origin}' is not in our list of allowed origins.");
			}
		}

		return $this->origin;
	}
}//end class
