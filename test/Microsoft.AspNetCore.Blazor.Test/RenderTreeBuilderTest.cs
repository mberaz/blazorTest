// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using Microsoft.AspNetCore.Blazor.Components;
using Microsoft.AspNetCore.Blazor.Rendering;
using Microsoft.AspNetCore.Blazor.RenderTree;
using Microsoft.AspNetCore.Blazor.Test.Shared;
using System;
using System.Linq;
using Xunit;

namespace Microsoft.AspNetCore.Blazor.Test
{
    public class RenderTreeBuilderTest
    {
        [Fact]
        public void RequiresNonnullRenderer()
        {
            Assert.Throws<ArgumentNullException>(() =>
            {
                new RenderTreeBuilder(null);
            });
        }

        [Fact]
        public void StartsEmpty()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Assert
            var frames = builder.GetFrames();
            Assert.NotNull(frames.Array);
            Assert.Empty(frames);
        }

        [Fact]
        public void CanAddText()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());
            var nullString = (string)null;

            // Act
            builder.AddText(0, "First item");
            builder.AddText(0, nullString);
            builder.AddText(0, "Second item");

            // Assert
            var frames = builder.GetFrames();
            Assert.Collection(frames,
                frame => AssertFrame.Text(frame, "First item"),
                frame => AssertFrame.Text(frame, string.Empty),
                frame => AssertFrame.Text(frame, "Second item"));
        }

        [Fact]
        public void CanAddNonStringValueAsText()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());
            var nullObject = (object)null;

            // Act
            builder.AddText(0, 1234);
            builder.AddText(0, nullObject);

            // Assert
            var frames = builder.GetFrames();
            Assert.Collection(frames,
                frame => AssertFrame.Text(frame, "1234"),
                frame => AssertFrame.Text(frame, string.Empty));
        }

        [Fact]
        public void UnclosedElementsHaveNoSubtreeLength()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act
            builder.OpenElement(0, "my element");

            // Assert
            var frame = builder.GetFrames().Single();
            AssertFrame.Element(frame, "my element", 0);
        }

        [Fact]
        public void ClosedEmptyElementsHaveSubtreeLengthOne()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act
            builder.AddText(0, "some frame so that the element isn't at position zero");
            builder.OpenElement(0, "my element");
            builder.CloseElement();

            // Assert
            var frames = builder.GetFrames();
            Assert.Equal(2, frames.Count);
            AssertFrame.Element(frames.Array[1], "my element", 1);
        }

        [Fact]
        public void ClosedElementsHaveCorrectSubtreeLength()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act
            builder.OpenElement(0, "my element");
            builder.AddText(0, "child 1");
            builder.AddText(0, "child 2");
            builder.CloseElement();
            builder.AddText(0, "unrelated item");

            // Assert
            var frames = builder.GetFrames();
            Assert.Equal(4, frames.Count);
            AssertFrame.Element(frames.Array[0], "my element", 3);
        }

        [Fact]
        public void CanNestElements()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act
            builder.AddText(0, "standalone text 1");   //  0: standalone text 1
            builder.OpenElement(0, "root");            //  1: <root>
            builder.AddText(0, "root text 1");         //  2:     root text 1
            builder.AddText(0, "root text 2");         //  3:     root text 2
            builder.OpenElement(0, "child");           //  4:     <child>
            builder.AddText(0, "child text");          //  5:         child text
            builder.OpenElement(0, "grandchild");      //  6:         <grandchild>
            builder.AddText(0, "grandchild text 1");   //  7:             grandchild text 1
            builder.AddText(0, "grandchild text 2");   //  8:             grandchild text 2
            builder.CloseElement();                    //             </grandchild>
            builder.CloseElement();                    //         </child>
            builder.AddText(0, "root text 3");         //  9:     root text 3
            builder.OpenElement(0, "child 2");         // 10:     <child 2>
            builder.CloseElement();                    //         </child 2>
            builder.CloseElement();                    //      </root>
            builder.AddText(0, "standalone text 2");   // 11:  standalone text 2

            // Assert
            Assert.Collection(builder.GetFrames(),
                frame => AssertFrame.Text(frame, "standalone text 1"),
                frame => AssertFrame.Element(frame, "root", 10),
                frame => AssertFrame.Text(frame, "root text 1"),
                frame => AssertFrame.Text(frame, "root text 2"),
                frame => AssertFrame.Element(frame, "child", 5),
                frame => AssertFrame.Text(frame, "child text"),
                frame => AssertFrame.Element(frame, "grandchild", 3),
                frame => AssertFrame.Text(frame, "grandchild text 1"),
                frame => AssertFrame.Text(frame, "grandchild text 2"),
                frame => AssertFrame.Text(frame, "root text 3"),
                frame => AssertFrame.Element(frame, "child 2", 1),
                frame => AssertFrame.Text(frame, "standalone text 2"));
        }

        [Fact]
        public void CanAddAttributes()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());
            UIEventHandler eventHandler = eventInfo => { };

            // Act
            builder.OpenElement(0, "myelement");                    //  0: <myelement
            builder.AddAttribute(0, "attribute1", "value 1");       //  1:     attribute1="value 1"
            builder.AddAttribute(0, "attribute2", 123);             //  2:     attribute2=intExpression123>
            builder.OpenElement(0, "child");                        //  3:   <child
            builder.AddAttribute(0, "childevent", eventHandler);    //  4:       childevent=eventHandler>
            builder.AddText(0, "some text");                        //  5:     some text
            builder.CloseElement();                                 //       </child>
            builder.CloseElement();                                 //     </myelement>

            // Assert
            Assert.Collection(builder.GetFrames(),
                frame => AssertFrame.Element(frame, "myelement", 6),
                frame => AssertFrame.Attribute(frame, "attribute1", "value 1"),
                frame => AssertFrame.Attribute(frame, "attribute2", "123"),
                frame => AssertFrame.Element(frame, "child", 3),
                frame => AssertFrame.Attribute(frame, "childevent", eventHandler),
                frame => AssertFrame.Text(frame, "some text"));
        }

        [Fact]
        public void CannotAddAttributeAtRoot()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act/Assert
            Assert.Throws<InvalidOperationException>(() =>
            {
                builder.AddAttribute(0, "name", "value");
            });
        }

        [Fact]
        public void CannotAddEventHandlerAttributeAtRoot()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act/Assert
            Assert.Throws<InvalidOperationException>(() =>
            {
                builder.AddAttribute(0, "name", eventInfo => { });
            });
        }

        [Fact]
        public void CannotAddAttributeToText()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act/Assert
            Assert.Throws<InvalidOperationException>(() =>
            {
                builder.OpenElement(0, "some element");
                builder.AddText(1, "hello");
                builder.AddAttribute(2, "name", "value");
            });
        }

        [Fact]
        public void CannotAddEventHandlerAttributeToText()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act/Assert
            Assert.Throws<InvalidOperationException>(() =>
            {
                builder.OpenElement(0, "some element");
                builder.AddText(1, "hello");
                builder.AddAttribute(2, "name", eventInfo => { });
            });
        }

        [Fact]
        public void CanAddChildComponents()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act
            builder.OpenElement(10, "parent");                   //  0: <parent>
            builder.OpenComponent<TestComponent>(11);            //  1:     <testcomponent
            builder.AddAttribute(12, "child1attribute1", "A");   //  2:       child1attribute1="A"
            builder.AddAttribute(13, "child1attribute2", "B");   //  3:       child1attribute2="B">
            builder.CloseComponent();                            //         </testcomponent>
            builder.OpenComponent<TestComponent>(14);            //  4:     <testcomponent
            builder.AddAttribute(15, "child2attribute", "C");    //  5:       child2attribute="C">
            builder.CloseComponent();                            //         </testcomponent>
            builder.CloseElement();                              //     </parent>

            // Assert
            Assert.Collection(builder.GetFrames(),
                frame => AssertFrame.Element(frame, "parent", 6),
                frame => AssertFrame.Component<TestComponent>(frame),
                frame => AssertFrame.Attribute(frame, "child1attribute1", "A"),
                frame => AssertFrame.Attribute(frame, "child1attribute2", "B"),
                frame => AssertFrame.Component<TestComponent>(frame),
                frame => AssertFrame.Attribute(frame, "child2attribute", "C"));
        }

        [Fact]
        public void CanClear()
        {
            // Arrange
            var builder = new RenderTreeBuilder(new TestRenderer());

            // Act
            builder.AddText(0, "some text");
            builder.OpenElement(1, "elem");
            builder.AddText(2, "more text");
            builder.CloseElement();
            builder.Clear();

            // Assert
            Assert.Empty(builder.GetFrames());
        }

        private class TestComponent : IComponent
        {
            public void BuildRenderTree(RenderTreeBuilder builder)
                => throw new NotImplementedException();
        }

        private class TestRenderer : Renderer
        {
            protected override void UpdateDisplay(RenderBatch renderBatch)
                => throw new NotImplementedException();
        }
    }
}
