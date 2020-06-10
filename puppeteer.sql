/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 100203
Source Host           : localhost:3306
Source Database       : puppeteer

Target Server Type    : MYSQL
Target Server Version : 100203
File Encoding         : 65001

Date: 2020-06-10 11:16:36
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for demo
-- ----------------------------
DROP TABLE IF EXISTS `demo`;
CREATE TABLE `demo` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `sort` int(20) DEFAULT NULL COMMENT '序号',
  `name` varchar(255) DEFAULT NULL COMMENT '店铺名',
  `score` varchar(255) DEFAULT NULL COMMENT '评分',
  `comment` varchar(50) DEFAULT NULL COMMENT '点评数',
  `price` varchar(50) DEFAULT NULL COMMENT '人均价格',
  `address` varchar(255) DEFAULT NULL COMMENT '地址',
  `shop_branch` tinyint(5) DEFAULT 1 COMMENT '是否分店 1非 2是',
  `iout` tinyint(5) DEFAULT 1 COMMENT '是否外卖 1非 2是',
  `advertisement` tinyint(5) DEFAULT 1 COMMENT '是否广告 1非 2是',
  `group_buy_state` tinyint(5) DEFAULT 1 COMMENT '是否团促 1非 2是',
  `group_buyList` text DEFAULT NULL COMMENT '团促信息列表',
  `create_time` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8 COMMENT='大众点评爬取数据';

-- ----------------------------
-- Records of demo
-- ----------------------------
