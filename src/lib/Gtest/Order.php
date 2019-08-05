<?php
namespace Gtest;

class Order {
	const SQL_GET_NEXT_ORDER_NUM = <<<xxx
		SELECT MAX(`orderNumber`) + 1 AS `orderNumber` FROM `orders`
xxx;

	const SQL_INSERT_ORDER = <<<xxx
		INSERT INTO `orders`
			(`orderNumber`,`orderDate`,`requiredDate`,`status`,`comments`,`customerNumber`)
			VALUES(%d,'%s','%s','%s','%s',%d)
xxx;

	const SQL_INSERT_ORDER_DETAILS = <<<xxx
		INSERT INTO `orderdetails`
			(`orderNumber`,`productCode`,`quantityOrdered`,`priceEach`,`orderLineNumber`)
			VALUES(%d,'%s',%d,%f,%d)
xxx;

	private $db;
	private $details;
	private $orderNumber;

	public function __construct($db, $details)
	{
		$this->db = $db;
		$this->details = $details;

		$this->order();
	}

	private function order()
	{
		// @todo should be using multi-query
		$this->orderNumber = $this->db->png(self::SQL_GET_NEXT_ORDER_NUM)[0]['orderNumber'];
		$this->createOrder();
		$this->createDetails();
	}

	private function createDetails()
	{
		$price = $this->details['price'];

		for ($i = 0; $i < count($this->details['cart']); $i += 1) {
			$product = $this->details['cart'][$i];
			$this->db->put(sprintf(
				self::SQL_INSERT_ORDER_DETAILS,
				$this->orderNumber,
				$this->db->escapeInput($product->productCode),
				\intval($product->quantity),
				\floatval($product->MSRP * $price),
				$i + 1
			));
		}
	}

	private function createOrder()
	{
		$today = (new \DateTime())->format('Y-m-d');
		$this->db->put(sprintf(
			self::SQL_INSERT_ORDER,
			$this->orderNumber,
			$today,
			$today,
			'In Process',
			isset($this->details['comment'])
				? $this->db->escapeInput($this->details['comment'])
				: '',
			\intval($this->details['customerNumber'])
		));
	}

	public function getDetails()
	{
		return [$this->orderNumber, $this->details];
	}

	public function getOrderNumber()
	{
		return $this->orderNumber;
	}
}