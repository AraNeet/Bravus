"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

const ColorSwatch = ({ color, name, hex }: { color: string; name: string; hex: string }) => (
  <div className="flex flex-col items-center">
    <div className={`w-20 h-20 rounded-md ${color}`} />
    <div className="mt-2 text-sm font-medium">{name}</div>
    <div className="text-xs text-muted-foreground">{hex}</div>
  </div>
);

export function DesignSystem() {
  return (
    <div className="space-y-10 p-6">
      <div>
        <h2 className="text-3xl font-bold mb-6">Design System</h2>
        <p className="text-lg text-muted-foreground mb-8">
          A comprehensive guide to our design language and components
        </p>
      </div>

      {/* Colors */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <ColorSwatch color="bg-navy" name="Primary" hex="#121420" />
          <ColorSwatch color="bg-mred" name="Secondary" hex="#B76D68" />
          <ColorSwatch color="bg-spink" name="Accent" hex="#F4A4A6" />
          <ColorSwatch color="bg-white" name="Background" hex="#FFFFFF" />
          <ColorSwatch color="bg-gteal" name="Text" hex="#5C6D70" />
        </div>
      </section>

      {/* Typography */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Typography</h3>
        <div className="space-y-4">
          <div>
            <h1 className="text-5xl font-bold">Heading 1</h1>
            <p className="text-sm text-muted-foreground mt-1">text-5xl font-bold</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold">Heading 2</h2>
            <p className="text-sm text-muted-foreground mt-1">text-4xl font-bold</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold">Heading 3</h3>
            <p className="text-sm text-muted-foreground mt-1">text-2xl font-semibold</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Heading 4</h4>
            <p className="text-sm text-muted-foreground mt-1">text-xl font-semibold</p>
          </div>
          <div>
            <p className="text-base">Body Text</p>
            <p className="text-sm text-muted-foreground mt-1">text-base</p>
          </div>
          <div>
            <p className="text-sm">Small Text</p>
            <p className="text-sm text-muted-foreground mt-1">text-sm</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Buttons</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2">
            <Button variant="default">Default</Button>
            <span className="text-sm text-muted-foreground">variant="default"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="secondary">Secondary</Button>
            <span className="text-sm text-muted-foreground">variant="secondary"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="accent">Accent</Button>
            <span className="text-sm text-muted-foreground">variant="accent"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="navy">Navy</Button>
            <span className="text-sm text-muted-foreground">variant="navy"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="muted">Muted</Button>
            <span className="text-sm text-muted-foreground">variant="muted"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="outline">Outline</Button>
            <span className="text-sm text-muted-foreground">variant="outline"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="ghost">Ghost</Button>
            <span className="text-sm text-muted-foreground">variant="ghost"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button variant="subtle">Subtle</Button>
            <span className="text-sm text-muted-foreground">variant="subtle"</span>
          </div>
        </div>
      </section>

      {/* Button Sizes */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Button Sizes</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col items-center gap-2">
            <Button size="sm" variant="navy">Small</Button>
            <span className="text-sm text-muted-foreground">size="sm"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button size="default" variant="navy">Default</Button>
            <span className="text-sm text-muted-foreground">size="default"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button size="lg" variant="navy">Large</Button>
            <span className="text-sm text-muted-foreground">size="lg"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button size="xl" variant="navy">Extra Large</Button>
            <span className="text-sm text-muted-foreground">size="xl"</span>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Default card with no variant specified.</p>
            </CardContent>
          </Card>
          
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Bordered Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with variant="bordered"</p>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with variant="elevated"</p>
            </CardContent>
          </Card>
          
          <Card variant="accent">
            <CardHeader>
              <CardTitle>Accent Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with variant="accent"</p>
            </CardContent>
          </Card>
          
          <Card variant="navy">
            <CardHeader>
              <CardTitle>Navy Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with variant="navy"</p>
            </CardContent>
          </Card>
          
          <Card variant="secondary">
            <CardHeader>
              <CardTitle>Secondary Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card with variant="secondary"</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Badges</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-2">
            <Badge variant="default">Default</Badge>
            <span className="text-sm text-muted-foreground">variant="default"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="secondary">Secondary</Badge>
            <span className="text-sm text-muted-foreground">variant="secondary"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="navy">Navy</Badge>
            <span className="text-sm text-muted-foreground">variant="navy"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="muted">Muted</Badge>
            <span className="text-sm text-muted-foreground">variant="muted"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="accent">Accent</Badge>
            <span className="text-sm text-muted-foreground">variant="accent"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="subtle">Subtle</Badge>
            <span className="text-sm text-muted-foreground">variant="subtle"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="outline">Outline</Badge>
            <span className="text-sm text-muted-foreground">variant="outline"</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="destructive">Destructive</Badge>
            <span className="text-sm text-muted-foreground">variant="destructive"</span>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Spacing</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="w-16 h-4 bg-navy rounded"></div>
            <span className="text-sm text-muted-foreground">4px (1)</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-32 h-8 bg-navy rounded"></div>
            <span className="text-sm text-muted-foreground">8px (2)</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-48 h-12 bg-navy rounded"></div>
            <span className="text-sm text-muted-foreground">12px (3)</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-64 h-16 bg-navy rounded"></div>
            <span className="text-sm text-muted-foreground">16px (4)</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-80 h-24 bg-navy rounded"></div>
            <span className="text-sm text-muted-foreground">24px (6)</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DesignSystem; 