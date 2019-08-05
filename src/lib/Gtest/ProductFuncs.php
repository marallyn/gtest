<?php
namespace Gtest;

class ProductFuncs {
	const SELECT_SQL = <<<xxx
		SELECT `products`.`productCode`, `products`.`productName`, `products`.`quantityInStock`, 
		SUBSTRING(`products`.`productDescription`,1,50) as `description`, `products`.`MSRP`,
			`products`.`productVendor`, `productlines`.`image`, `products`.`buyPrice`
		FROM `products`
		JOIN `productlines` on `productlines`.`productLine`=`products`.`productLine`
xxx;
	const COUNT_SQL = <<<xxx
		SELECT COUNT(`products`.`productCode`) as `count`
		FROM `products`
		JOIN `productlines` on `productlines`.`productLine`=`products`.`productLine`
xxx;

	private $count;
	private $countSql;
	private $db;
	private $filter;
	private $max;
	private $page;
	private $pages;
	private $selectSql;
	private $where;

	public function __construct($db, $filter, $max, $page)
	{
		$this->db = $db;
		$this->filter = $db->escapeInput($filter);
		$this->max = max(\intval($max), 1);
		$this->page = max(\intval($page), 1);

		$this->buildSql();
		$this->doCount();
		$this->doResults();
	}

	private function buildSql()
	{
		$this->where = $this->filter
			? " WHERE `products`.`productName` LIKE '%{$this->filter}%'"
			: '';
		$orderSql = " ORDER BY `products`.`productName`";
		$limitSql = sprintf(" LIMIT %d,%d", ($this->page - 1) * $this->max, $this->max);
		$this->selectSql = self::SELECT_SQL . $this->where . $orderSql . $limitSql;

		$this->countSql = self::COUNT_SQL . $this->where;
	}

	private function doCount()
	{
		$this->count = \intval($this->db->png($this->countSql)[0]['count']);
		$this->pages = \ceil($this->count / $this->max);
	}

	private function doResults()
	{
		$this->results = $this->db->png($this->selectSql);
	}

	public function getCount()
	{
		return $this->count;
	}

	public function getPage()
	{
		return $this->page;
	}

	public function getPages()
	{
		return $this->pages;
	}

	public function getResults()
	{
		return $this->results;
	}
}