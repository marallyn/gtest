<?php
use Gtest\Api;
use Gtest\Credentials;
use Gtest\Db;
use Gtest\Order;
use Gtest\Payment;
use Gtest\ProductFuncs;
use Gtest\Report;
// show errors in all contexts
error_reporting(E_ALL);
ini_set('display_errors', 'stdout');
spl_autoload_register(function ($className) {
	include_once dirname(__DIR__) . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . str_replace('\\', DIRECTORY_SEPARATOR, $className) . '.php';
});

$isLocal = false !== strpos(__DIR__, "/jeff/");

if ($isLocal) {
	// local server
	$credFile = dirname(dirname(__DIR__));
} else {
	$credFile = dirname(__DIR__);
}

$credFile .= DIRECTORY_SEPARATOR . 'credentials'
	. DIRECTORY_SEPARATOR . 'gtest-db.json';
$creds = new Credentials($credFile, $isLocal);

$db = new Db(
	$creds->getCred('host'),
	$creds->getCred('user'),
	$creds->getCred('pwd'),
	$creds->getCred('db')
);

// start the api
$api = new Api();
switch ($api->getMethod()) {
	case "GET":
		switch ($api->getEndpoint()) {
			case 'customer':
				$db->put("SELECT `customerName`,`customerNumber`,`creditLimit` FROM `customers` ORDER BY `customerName`");
				$api->addResult($db->get(), 'customers');
				break;
			case 'location':
				$db->put(sprintf(
					"SELECT `location`.`price` FROM `location` WHERE `location`.`location`='%s'",
					$db->escapeInput($api->getParams('location'))
				));
				$api->addResult($db->get()[0]['price'], 'price');
				break;
			case 'product':
				$pf = new ProductFuncs($db, $api->getParams('filter'), $api->getParams('max'), $api->getParams('page'));
				$api->addResult($pf->getResults(), 'products');
				$api->addResult($pf->getCount(), 'count');
				$api->addResult($pf->getPage(), 'page');
				$api->addResult($pf->getPages(), 'pages');
				break;
			case 'report':
				$report = new Report($db, $api->getParams('reportName'));
				$api->addResult($report->getReportData(), 'report');
				break;
			default:
				$api->setResponseCode(400);
				$api->addResult("The " . $api->getEndpoint() . " endpoint does not support GET.", 'error');
				break;
		}
		break;
	case "POST":
		switch ($api->getEndpoint()) {
			case 'order':
				$order = new Order($db, $api->getParams());
				$api->addResult($order->getOrderNumber(), 'orderNumber');
				break;
			case 'payment':
				$payment = new Payment($db, $api->getParams('customerNumber'), $api->getParams('payment'));
				if ($payment->getError()) {
					$api->addResult($payment->getError(), 'error');
				} else {
					$api->addResult("Your payment of $" . $api->getParams('payment')->amount . " has been applied.", 'payment');
				}
				break;
			default:
				$api->setResponseCode(400);
				$api->addResult("The " . $api->getEndpoint() . " endpoint does not support GET.", 'error');
				break;
		}
		break;
	default:
		$api->addResult("WTF", 'info');
		break;
}
$api->respond();