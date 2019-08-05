<?php
namespace Gtest;

class Payment {
	const SQL_PAYMENTS_VS_ORDERS = <<<xxx
		SELECT `p`.`totalPayments`,`o`.`orderTotal`
		FROM (
			SELECT IFNULL(SUM(`payments`.`amount`),0) AS `totalPayments`, 'fart' AS `crazyKey`
			FROM `payments`
			WHERE `payments`.`customerNumber`=%d
		) AS `p`
		JOIN (
			SELECT IFNULL(SUM(`orderdetails`.`quantityOrdered`*`orderdetails`.`priceEach`),0) AS `orderTotal`,
				'fart' AS `crazyKey`
			FROM `orderdetails`
			JOIN `orders` ON `orders`.`orderNumber`=`orderdetails`.`orderNumber`
			WHERE `orders`.`customerNumber`=%d
		) AS `o` ON `o`.`crazyKey`=`p`.`crazyKey`
xxx;
	const SQL_RECORD_PAYMENT = <<<xxx
		INSERT INTO `payments` (`customerNumber`,`checkNumber`,`paymentDate`,`amount`)
		VALUES (%d,'%s','%s',%f)
xxx;

	private $balance;
	private $customerNumber;
	private $db;
	private $error;
	private $hasBalance;
	private $payment;

	public function __construct($db, $customerNumber, $payment)
	{
		$this->db = $db;
		$this->customerNumber = \intval($customerNumber);
		$this->payment = $payment;

		if ($this->customerHasBalance()) {
			if ($this->balance >= \floatval($this->payment->amount)) {
				$this->recordPayment();
			} else {
				$this->error = "Your balance of \${$this->balance} is less than your payment of \${$this->payment->amount}.";
			}
		} else {
			$this->error = "Your balance of \${$this->balance} is less than your payment of \${$this->payment->amount}.";
		}
	}

	private function customerHasBalance()
	{
		$sql = \sprintf(self::SQL_PAYMENTS_VS_ORDERS, $this->customerNumber, $this->customerNumber);
		$result = $this->db->png($sql)[0];
		$this->balance = \floatval($result['orderTotal']) - \floatval($result['totalPayments']);
		$this->hasBalance = $this->balance > 0;

		return $this->hasBalance;
	}

	private function recordPayment()
	{
		$this->db->put(\sprintf(
			self::SQL_RECORD_PAYMENT,
			$this->customerNumber,
			$this->db->escapeInput($this->payment->checkNum),
			(new \DateTime())->format('Y-m-d'),
			\floatval($this->payment->amount)
		));
	}

	public function getError()
	{
		return $this->error;
	}
}