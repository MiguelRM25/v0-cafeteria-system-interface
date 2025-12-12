"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  LogOut,
  BarChart3,
  Package,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Type definitions
type Category =
  | "main"
  | "bebidas"
  | "alimentos"
  | "bebidas-frias"
  | "bebidas-calientes"
  | "frappes"
  | "postres"
  | "salados"

type UserRole = "Caja" | "Administrador" | null

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

interface CartItem extends MenuItem {
  quantity: number
}

interface InventoryItem {
  id: string
  name: string
  stock: number
  maxStock: number
}

interface Sale {
  id: string
  date: string
  items: CartItem[]
  total: number
}

type ModalType = "cross-sell" | "add-more-drinks" | "add-more-food" | "confirm-order" | "final-total" | null

// Menu data
const SABORES_BEBIDAS = [
  { id: "vainilla", name: "Vainilla", price: 65 },
  { id: "moka", name: "Moka", price: 70 },
  { id: "cajeta", name: "Cajeta", price: 70 },
  { id: "tradicional", name: "Tradicional", price: 60 },
  { id: "chai", name: "Chai", price: 75 },
  { id: "matcha", name: "Matcha", price: 80 },
  { id: "taro", name: "Taro", price: 75 },
]

const FRAPPES_ADICIONALES = [
  { id: "smoothie-fresa", name: "Smoothie de Fresa", price: 85 },
  { id: "smoothie-mango", name: "Smoothie de Mango", price: 85 },
  { id: "chamoyada", name: "Chamoyada", price: 90 },
  { id: "mazapan", name: "Mazapán", price: 80 },
  { id: "oreo", name: "Oreo", price: 85 },
  { id: "nutella", name: "Nutella", price: 90 },
]

const POSTRES = [
  { id: "concha", name: "Concha", price: 45 },
  { id: "panque", name: "Panque", price: 55 },
  { id: "pay", name: "Rebanada de Pay", price: 70 },
  { id: "tartaleta", name: "Tartaleta", price: 65 },
  { id: "pastel", name: "Rebanada de Pastel", price: 85 },
  { id: "dona", name: "Dona", price: 50 },
  { id: "rol-canela-cajeta", name: "Rol de Canela con Cajeta", price: 60 },
  { id: "rol-canela-manzana", name: "Rol de Canela con Manzana", price: 60 },
]

const SALADOS = [
  { id: "sandwich-jamon", name: "Sandwich de Jamón", price: 75 },
  { id: "sandwich-pavo", name: "Sandwich de Pavo", price: 80 },
  { id: "sandwich-integral", name: "Sandwich Integral", price: 85 },
  { id: "croissant", name: "Croissant de Jamón y Queso", price: 90 },
  { id: "pizza-peperoni", name: "Mini Pizza de Peperoni", price: 95 },
  { id: "pizza-jamon", name: "Mini Pizza de Jamón", price: 90 },
  { id: "pizza-queso", name: "Mini Pizza de Queso", price: 85 },
  { id: "pizza-veggie", name: "Mini Pizza Veggie", price: 100 },
]

const createInitialInventory = (): InventoryItem[] => {
  const allProducts = [...SABORES_BEBIDAS, ...FRAPPES_ADICIONALES, ...POSTRES, ...SALADOS]

  return allProducts.map((product) => ({
    id: product.id,
    name: product.name,
    stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
    maxStock: 50,
  }))
}

export default function CafeteriaSystem() {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const [adminView, setAdminView] = useState<"sales" | "inventory">("sales")
  const [sales, setSales] = useState<Sale[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  // Existing state
  const [currentView, setCurrentView] = useState<Category>("main")
  const [cart, setCart] = useState<CartItem[]>([])
  const [modalType, setModalType] = useState<ModalType>(null)
  const [pendingCategory, setPendingCategory] = useState<"bebidas" | "alimentos" | null>(null)
  const [isCartMinimized, setIsCartMinimized] = useState(false)

  useEffect(() => {
    const storedSales = localStorage.getItem("cafeteria-sales")
    const storedInventory = localStorage.getItem("cafeteria-inventory")

    if (storedSales) {
      setSales(JSON.parse(storedSales))
    }

    if (storedInventory) {
      setInventory(JSON.parse(storedInventory))
    } else {
      const initialInventory = createInitialInventory()
      setInventory(initialInventory)
      localStorage.setItem("cafeteria-inventory", JSON.stringify(initialInventory))
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (username === "Caja" && password === "123456") {
      setUserRole("Caja")
    } else if (username === "Administrador" && password === "Administrador") {
      setUserRole("Administrador")
    } else {
      setLoginError("Usuario o contraseña incorrectos")
    }
  }

  const handleLogout = () => {
    setUserRole(null)
    setUsername("")
    setPassword("")
    setCurrentView("main")
    setCart([])
  }

  const updateInventory = (items: { id: string; quantity: number }[]) => {
    setInventory((prevInventory) => {
      const updatedInventory = prevInventory.map((invItem) => {
        const soldItem = items.find((item) => item.id === invItem.id)
        if (soldItem) {
          return {
            ...invItem,
            stock: Math.max(0, invItem.stock - soldItem.quantity),
          }
        }
        return invItem
      })

      localStorage.setItem("cafeteria-inventory", JSON.stringify(updatedInventory))
      return updatedInventory
    })
  }

  const restockItem = (itemId: string, amount: number) => {
    setInventory((prevInventory) => {
      const updatedInventory = prevInventory.map((invItem) => {
        if (invItem.id === itemId) {
          return {
            ...invItem,
            stock: Math.min(invItem.stock + amount, invItem.maxStock),
          }
        }
        return invItem
      })

      localStorage.setItem("cafeteria-inventory", JSON.stringify(updatedInventory))
      return updatedInventory
    })
  }

  const getStockColor = (stock: number, maxStock: number) => {
    const percentage = (stock / maxStock) * 100
    if (percentage === 0) return "bg-red-500"
    if (percentage <= 50) return "bg-orange-500"
    return "bg-green-500"
  }

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing && existing.quantity > 1) {
        return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleFinishSelection = (category: "bebidas" | "alimentos") => {
    setPendingCategory(category)
    if (category === "bebidas") {
      setModalType("add-more-drinks")
    } else {
      setModalType("add-more-food")
    }
  }

  const handleAddMoreResponse = (addMore: boolean) => {
    setModalType(null)

    if (addMore) {
      // Return to category selection
      if (pendingCategory === "bebidas") {
        setCurrentView("bebidas")
      } else {
        setCurrentView("alimentos")
      }
      // Don't reset pendingCategory yet, in case they want to keep adding
    } else {
      // Ask about cross-sell (opposite category)
      setModalType("cross-sell")
    }
  }

  const handleCrossSellResponse = (addMore: boolean) => {
    if (addMore) {
      if (pendingCategory === "bebidas") {
        setCurrentView("alimentos")
      } else {
        setCurrentView("bebidas")
      }
    } else {
      setCurrentView("main")
    }
    setModalType(null)
    setPendingCategory(null)
  }

  const handleCheckout = () => {
    if (cart.length > 0) {
      setModalType("confirm-order")
    }
  }

  const handleConfirmOrder = () => {
    const newSale: Sale = {
      id: Date.now().toString(),
      date: new Date().toLocaleString("es-MX"),
      items: cart,
      total: getTotalPrice(),
    }

    const updatedSales = [...sales, newSale]
    setSales(updatedSales)
    localStorage.setItem("cafeteria-sales", JSON.stringify(updatedSales))

    updateInventory(cart)

    setModalType("final-total")
  }

  const handleCloseFinalTotal = () => {
    setCart([])
    setCurrentView("main")
    setModalType(null)
  }

  const goBack = () => {
    switch (currentView) {
      case "bebidas-frias":
      case "bebidas-calientes":
      case "frappes":
        setCurrentView("bebidas")
        break
      case "postres":
      case "salados":
        setCurrentView("alimentos")
        break
      default:
        setCurrentView("main")
    }
  }

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-2">
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Coffee className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-primary">Cafetería</h1>
              <p className="text-muted-foreground">Iniciar Sesión</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="mt-1"
                  required
                />
              </div>

              {loginError && <p className="text-sm text-red-500 text-center">{loginError}</p>}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (userRole === "Administrador") {
    return (
      <div className="min-h-screen bg-background p-6">
        <header className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary">Panel de Administrador</h1>
              <p className="text-muted-foreground">Gestión de cafetería</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              variant={adminView === "sales" ? "default" : "outline"}
              onClick={() => setAdminView("sales")}
              className={adminView === "sales" ? "bg-primary text-primary-foreground" : ""}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Ventas
            </Button>
            <Button
              variant={adminView === "inventory" ? "default" : "outline"}
              onClick={() => setAdminView("inventory")}
              className={adminView === "inventory" ? "bg-primary text-primary-foreground" : ""}
            >
              <Package className="mr-2 h-5 w-5" />
              Inventario
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          {adminView === "sales" && (
            <div>
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Historial de Ventas</h2>

                  {sales.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No hay ventas registradas</p>
                  ) : (
                    <>
                      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Ventas</p>
                            <p className="text-2xl font-bold text-primary">{sales.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                            <p className="text-2xl font-bold text-primary">
                              ${sales.reduce((sum, sale) => sum + sale.total, 0)} MXN
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Promedio por Venta</p>
                            <p className="text-2xl font-bold text-primary">
                              ${Math.round(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length)} MXN
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {sales
                          .slice()
                          .reverse()
                          .map((sale) => (
                            <Card key={sale.id} className="bg-muted/30">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <p className="font-semibold">Venta #{sale.id}</p>
                                    <p className="text-sm text-muted-foreground">{sale.date}</p>
                                  </div>
                                  <Badge variant="secondary" className="text-lg">
                                    ${sale.total} MXN
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  {sale.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span>
                                        {item.name} x{item.quantity}
                                      </span>
                                      <span className="font-semibold">${item.price * item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {adminView === "inventory" && (
            <div>
              <Card className="bg-card">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Control de Inventario</h2>

                  <div className="mb-6 flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Stock completo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Stock medio (≤50%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-sm">Agotado</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventory.map((item) => {
                      const stockPercentage = (item.stock / item.maxStock) * 100
                      const colorClass = getStockColor(item.stock, item.maxStock)

                      return (
                        <Card key={item.id} className={`${colorClass} bg-opacity-10 border-2`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-bold text-sm">{item.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Stock: {item.stock} / {item.maxStock}
                                </p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                            </div>

                            <div className="w-full bg-muted rounded-full h-2 mb-3">
                              <div
                                className={`h-2 rounded-full ${colorClass}`}
                                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                              ></div>
                            </div>

                            {item.stock === 0 && (
                              <p className="text-xs text-red-600 font-semibold mb-2">⚠️ Contactar proveedor urgente</p>
                            )}
                            {item.stock > 0 && stockPercentage <= 50 && (
                              <p className="text-xs text-orange-600 font-semibold mb-2">
                                ⚠️ Considerar reabastecimiento
                              </p>
                            )}

                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs bg-transparent"
                                onClick={() => restockItem(item.id, 10)}
                                disabled={item.stock >= item.maxStock}
                              >
                                +10
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs bg-transparent"
                                onClick={() => restockItem(item.id, 25)}
                                disabled={item.stock >= item.maxStock}
                              >
                                +25
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1 text-xs"
                                onClick={() => restockItem(item.id, item.maxStock - item.stock)}
                                disabled={item.stock >= item.maxStock}
                              >
                                Llenar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Render POS interface for "Caja" user
  const renderMainMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-2 hover:border-primary"
        onClick={() => setCurrentView("bebidas")}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 gap-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Coffee className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-center">Bebidas</h2>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-2 hover:border-primary"
        onClick={() => setCurrentView("alimentos")}
      >
        <CardContent className="flex flex-col items-center justify-center p-12 gap-4">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-center">Alimentos</h2>
        </CardContent>
      </Card>
    </div>
  )

  const renderBebidasMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[
        { id: "frias", label: "Bebidas Frías", emoji: "🧊", view: "bebidas-frias" as Category },
        { id: "calientes", label: "Bebidas Calientes", emoji: "☕", view: "bebidas-calientes" as Category },
        { id: "frappes", label: "Frappes", emoji: "🥤", view: "frappes" as Category },
      ].map((option) => (
        <Card
          key={option.id}
          className="cursor-pointer hover:shadow-lg transition-shadow bg-card border-2 hover:border-primary"
          onClick={() => setCurrentView(option.view)}
        >
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <div className="text-6xl">{option.emoji}</div>
            <h3 className="text-2xl font-bold text-center">{option.label}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderAlimentosMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {[
        { id: "postres", label: "Postres", emoji: "🧁", view: "postres" as Category },
        { id: "salados", label: "Alimentos Salados", emoji: "🥪", view: "salados" as Category },
      ].map((option) => (
        <Card
          key={option.id}
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-card border hover:border-accent"
          onClick={() => setCurrentView(option.view)}
        >
          <CardContent className="p-12 flex flex-col items-center gap-4">
            <div className="text-7xl">{option.emoji}</div>
            <h3 className="text-2xl font-bold text-center">{option.label}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderItemList = (items: typeof SABORES_BEBIDAS, title: string, subtitle?: string) => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-card border hover:border-primary"
            onClick={() => addToCart({ ...item, category: title })}
          >
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Coffee className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold text-center text-lg">{item.name}</h4>
              <Badge variant="secondary" className="text-lg font-semibold">
                ${item.price}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={() =>
            handleFinishSelection(
              currentView.includes("bebidas") || currentView === "frappes" ? "bebidas" : "alimentos",
            )
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Check className="mr-2 h-5 w-5" />
          Terminar selección de {title}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentView !== "main" && (
              <Button
                variant="outline"
                size="icon"
                onClick={goBack}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-primary">Cafetería</h1>
              <p className="text-muted-foreground">Sistema de Punto de Venta - {userRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Card className="bg-card border-2">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">${getTotalPrice()}</p>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {modalType === "add-more-drinks" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">¿Desea agregar otra bebida de otro sabor o tipo?</h3>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleAddMoreResponse(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sí, agregar más bebidas
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleAddMoreResponse(false)}>
                  No, continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {modalType === "add-more-food" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">¿Desea agregar otro postre o alimento?</h3>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleAddMoreResponse(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sí, agregar más alimentos
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleAddMoreResponse(false)}>
                  No, continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {modalType === "cross-sell" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                ¿Desea agregar {pendingCategory === "bebidas" ? "alimentos" : "bebidas"}?
              </h3>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleCrossSellResponse(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Sí, agregar
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleCrossSellResponse(false)}>
                  No, gracias
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {modalType === "confirm-order" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full bg-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">¿Confirmar la orden?</h3>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-primary">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-primary">${getTotalPrice()} MXN</span>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleConfirmOrder}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Confirmar Orden
                </Button>
                <Button size="lg" variant="outline" onClick={() => setModalType(null)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {modalType === "final-total" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-card border-4 border-primary">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary" />
              </div>

              <h3 className="text-3xl font-bold mb-2">¡Orden Confirmada!</h3>
              <p className="text-muted-foreground mb-6">Gracias por su compra</p>

              <div className="bg-muted/50 p-6 rounded-lg mb-6">
                <p className="text-lg text-muted-foreground mb-2">Total a Pagar</p>
                <p className="text-4xl font-bold text-primary">${getTotalPrice()} MXN</p>
              </div>

              <Button
                size="lg"
                onClick={handleCloseFinalTotal}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="max-w-7xl mx-auto">
        {currentView === "main" && renderMainMenu()}
        {currentView === "bebidas" && renderBebidasMenu()}
        {currentView === "alimentos" && renderAlimentosMenu()}
        {currentView === "bebidas-frias" &&
          renderItemList(SABORES_BEBIDAS, "Bebidas Frías", "Selecciona tu sabor favorito")}
        {currentView === "bebidas-calientes" &&
          renderItemList(SABORES_BEBIDAS, "Bebidas Calientes", "Perfectas para cualquier momento")}
        {currentView === "frappes" &&
          renderItemList([...SABORES_BEBIDAS, ...FRAPPES_ADICIONALES], "Frappes", "Refrescantes y deliciosos")}
        {currentView === "postres" && renderItemList(POSTRES, "Postres", "Endulza tu día")}
        {currentView === "salados" && renderItemList(SALADOS, "Alimentos Salados", "Para saciar tu hambre")}
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 w-96 max-h-[500px] overflow-hidden z-40">
          <Card className="bg-card border-2 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito de Compras
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCartMinimized(!isCartMinimized)}
                  className="h-8 w-8 p-0"
                >
                  {isCartMinimized ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </div>
              {!isCartMinimized && (
                <>
                  <Separator className="mb-4" />
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                            className="h-7 w-7 p-0"
                          >
                            -
                          </Button>
                          <span className="font-bold w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart({ ...item, category: item.category })}
                            className="h-7 w-7 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="mb-4" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">${getTotalPrice()}</span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleCheckout}
                  >
                    Cobrar
                  </Button>
                </>
              )}
              {isCartMinimized && (
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">Total:</span>
                  <span className="text-lg font-bold text-primary">${getTotalPrice()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
