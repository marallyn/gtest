<?php
namespace Gtest;

class Report {
	const SQL_SALES_COMMISSION = <<<xxx
		SELECT `a`.`name`, CONCAT('$',FORMAT(IFNULL(`b`.`totalPayments`,0),2)) AS `totalPayments`,
			CONCAT('$',FORMAT((IFNULL(`b`.`totalPayments`,0)*`a`.`rate`),2)) AS `commission`
		FROM (
			SELECT `employees`.`employeeNumber`, CONCAT(`employees`.`firstName`,' ',`employees`.`lastName`) AS `name`,
			IF(`offices`.`country`='USA',0.1,0.08) AS `rate`
			FROM `employees`
			JOIN `offices` ON `offices`.`officeCode`=`employees`.`officeCode`
			WHERE 1
		) AS `a`
		LEFT JOIN	(
			SELECT SUM(`payments`.`amount`) AS `totalPayments`, `customers`.`salesRepEmployeeNumber` AS `employeeNumber`
			FROM `payments`
			JOIN `customers` ON `customers`.`customerNumber`=`payments`.`customerNumber`
			WHERE 1
			GROUP BY `customers`.`salesRepEmployeeNumber`
		) AS `b` ON `b`.`employeeNumber`=`a`.`employeeNumber`
		ORDER BY `a`.`name`
xxx;

	const SQL_OFFICE_COMMISSION = <<<xxx
		SELECT `a`.`territory`,`a`.`city`,`a`.`country`,
			CONCAT('$',FORMAT(IFNULL(`b`.`totalPayments`,0),2)) AS `totalPayments`,
			CONCAT('$',FORMAT((IFNULL(`b`.`totalPayments`,0)*`a`.`rate`),2)) AS `commission`
		FROM (
			SELECT `offices`.`officeCode`,`offices`.`territory`,`offices`.`country`,`offices`.`city`,
				IF(`offices`.`country`='USA',0.1,0.08) AS `rate`
			FROM `offices` WHERE 1
		) AS `a`
		JOIN (
			SELECT SUM(`payments`.`amount`) AS `totalPayments`,`offices`.`officeCode`
			FROM `payments`
			JOIN `customers` ON `customers`.`customerNumber`=`payments`.`customerNumber`
			JOIN `employees` ON `employees`.`employeeNumber`=`customers`.`salesRepEmployeeNumber`
			JOIN `offices` ON `offices`.`officeCode`=`employees`.`officeCode`
			WHERE 1
			GROUP BY `offices`.`officeCode`
		) AS `b` ON `b`.`officeCode`=`a`.`officeCode`
		ORDER BY `a`.`territory`,`a`.`city`,`a`.`country`
xxx;

	const SQL_PRODUCT_SALES = <<<xxx
		SELECT `a`.*,`b`.`productName`,`b`.`quantityOrdered`,
		CONCAT('$',FORMAT((IFNULL(`b`.`priceEach`,0)),2)) AS `priceEach`
		FROM (
			SELECT `orders`.`orderNumber`,`customers`.`customerName`,
				DATE_FORMAT(`orders`.`orderDate`,'%c/%e/%Y') AS `orderDate`,
				CONCAT('$',FORMAT(IFNULL(SUM(`orderdetails`.`quantityOrdered`*`orderdetails`.`priceEach`),0),2)) AS `orderTotal`,
				`orders`.`status`
			FROM `orders`
			JOIN `orderdetails` ON `orderdetails`.`orderNumber`=`orders`.`orderNumber`
			JOIN `customers` ON `customers`.`customerNumber`=`orders`.`customerNumber`
			WHERE 1
			GROUP BY `orderdetails`.`orderNumber`
		) AS `a`
		LEFT JOIN (
			SELECT `orderdetails`.`orderNumber`,`products`.`productName`,
				`orderdetails`.`quantityOrdered`,`orderdetails`.`priceEach`
			FROM `orderdetails`
			JOIN `products` ON `products`.`productCode`=`orderdetails`.`productCode`
			WHERE 1
			ORDER BY `orderdetails`.`orderNumber`,`orderdetails`.`orderLineNumber`
		) AS `b` ON `b`.`orderNumber`=`a`.`orderNumber`
xxx;

	private $align;
	private $columnNames;
	private $columnText;
	private $data;
	private $db;
	private $html;
	private $name;

	public function __construct($db, $name)
	{
		$this->db = $db;
		$this->name = $name;

		$this->doReport();
	}

	private function doReport()
	{
		switch ($this->name) {
			case 'office-commission':
				$this->officeCommission();
				break;
			case 'product-sales':
				$this->productSales();
				break;
			case 'sales-commission':
				$this->salesCommission();
				break;
			default:
				$this->noReport();
				break;
		}
	}

	public function getReportData()
	{
		return [
			'align' => $this->align,
			'columnNames' => $this->columnNames,
			'columnText' => $this->columnText,
			'data' => $this->data
		];
	}

	private function noReport()
	{
		$this->data = ['col' => 'No Report With That Name'];
		$this->columnNames = ['col'];
		$this->columnText = ['Can\'t Run Report'];
	}

	private function officeCommission()
	{
		$this->align = ['left', 'left', 'left', 'right', 'right'];
		$this->columnNames = ['territory', 'city', 'country', 'totalPayments', 'commission'];
		$this->columnText = ['Territory', 'City', 'Country', 'Total Sales', 'Commission'];
		$this->data = $this->db->png(self::SQL_OFFICE_COMMISSION);
	}

	private function productSales()
	{
		$this->align = ['left', 'left', 'left', 'right','left', 'left', 'right', 'right'];
		$this->columnNames = [
			'orderNumber',
			'customerName',
			'orderDate',
			'orderTotal',
			'status',
			'productName',
			'quantityOrdered',
			'priceEach'
		];
		$this->columnText = [
			'Order Number',
			'Customer Name',
			'Order Date',
			'Order Total',
			'Status',
			'Product Name',
			'Quantity Ordered',
			'Price Each'
		];
		$this->data = $this->db->png(self::SQL_PRODUCT_SALES);
	}

	private function salesCommission()
	{
		$this->align = ['left', 'right', 'right'];
		$this->columnNames = ['name', 'totalPayments', 'commission'];
		$this->columnText = ['Name', 'Total Sales', 'Commission'];
		$this->data = $this->db->png(self::SQL_SALES_COMMISSION);
	}
}