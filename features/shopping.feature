@ui
Feature: Shopping
  As a signed-in customer
  I want to find products and buy them
  So that I receive a confirmed order

  Background:
    Given I am signed in as "standard_user"

  Scenario Outline: Products can be sorted (<sort>)
    When I sort the products by "<sort>"
    Then the first product is "<first>"

    Examples:
      | sort                | first                             |
      | Name (A to Z)       | Sauce Labs Backpack               |
      | Name (Z to A)       | Test.allTheThings() T-Shirt (Red) |
      | Price (low to high) | Sauce Labs Onesie                 |
      | Price (high to low) | Sauce Labs Fleece Jacket          |

  @smoke
  Scenario: Buy two products end to end
    When I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    Then the cart badge shows "2"
    When I check out as "Asha" "Rao" with postal code "500081"
    Then the order total is the item total plus 8% tax
    When I finish the order
    Then I see the confirmation "Thank you for your order!"
